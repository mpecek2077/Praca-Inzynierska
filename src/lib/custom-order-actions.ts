"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { saveCustomModelFile } from "@/lib/custom-model-upload";
import { prisma } from "@/lib/prisma";
import {
  calculateCustomQuote,
  COMPLEXITY_OPTIONS,
  FINISH_OPTIONS,
  INFILL_OPTIONS,
  MATERIAL_OPTIONS,
  QUALITY_OPTIONS,
} from "@/lib/pricing";

export type CustomOrderState = {
  error?: string;
  orderId?: string;
};

const customSchema = z.object({
  brandId: z.string().min(1),
  modelId: z.string().min(1),
  description: z.string().trim().min(10, "Opisz część (min. 10 znaków)"),
  complexity: z.coerce
    .number()
    .refine((v): v is (typeof COMPLEXITY_OPTIONS)[number] =>
      (COMPLEXITY_OPTIONS as readonly number[]).includes(v),
    ),
  material: z.enum(MATERIAL_OPTIONS),
  volumeCm3: z.coerce.number().min(1).max(5000),
  infill: z.coerce
    .number()
    .refine((v): v is (typeof INFILL_OPTIONS)[number] =>
      (INFILL_OPTIONS as readonly number[]).includes(v),
    ),
  quality: z.enum(QUALITY_OPTIONS),
  finish: z.enum(FINISH_OPTIONS),
});

export async function submitCustomQuoteAction(
  formData: FormData,
): Promise<CustomOrderState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Musisz być zalogowany, aby wysłać wycenę do akceptacji." };
  }

  const parsed = customSchema.safeParse({
    brandId: formData.get("brandId"),
    modelId: formData.get("modelId"),
    description: formData.get("description"),
    complexity: formData.get("complexity"),
    material: formData.get("material"),
    volumeCm3: formData.get("volumeCm3"),
    infill: formData.get("infill"),
    quality: formData.get("quality"),
    finish: formData.get("finish"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Błędne dane formularza" };
  }

  const modelFileEntry = formData.get("modelFile");
  const modelFile =
    modelFileEntry instanceof File ? modelFileEntry : null;
  const upload = await saveCustomModelFile(modelFile);
  if (upload.error) {
    return { error: upload.error };
  }

  const model = await prisma.model.findFirst({
    where: {
      id: parsed.data.modelId,
      brandId: parsed.data.brandId,
    },
    include: { brand: true },
  });

  if (!model) {
    return { error: "Nieprawidłowa marka lub model." };
  }

  const quote = calculateCustomQuote({
    material: parsed.data.material,
    volumeCm3: parsed.data.volumeCm3,
    infill: parsed.data.infill,
    quality: parsed.data.quality,
    finish: parsed.data.finish,
  });

  const payload = {
    brandId: model.brandId,
    brandName: model.brand.name,
    modelId: model.id,
    modelName: model.name,
    description: parsed.data.description,
    complexity: parsed.data.complexity,
    material: parsed.data.material,
    volumeCm3: parsed.data.volumeCm3,
    infill: parsed.data.infill,
    quality: parsed.data.quality,
    finish: parsed.data.finish,
    estimatedPrice: quote.estimatedPrice,
    breakdown: quote.breakdown,
    ...(upload.saved
      ? {
          modelFileName: upload.saved.modelFileName,
          modelFilePath: upload.saved.modelFilePath,
          modelFileSize: upload.saved.modelFileSize,
        }
      : {}),
  };

  const order = await prisma.order.create({
    data: {
      userId: session.user.id,
      type: "CUSTOM",
      status: "NEW",
      totalPln: quote.estimatedPrice,
      customPayload: payload,
    },
    select: { id: true },
  });

  return { orderId: order.id };
}
