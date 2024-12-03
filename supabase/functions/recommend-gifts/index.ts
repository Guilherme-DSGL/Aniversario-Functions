import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { requestRecommendedGiftOpenIA } from "../_shared/domain/utils/open-ia.ts";
import { parseObjectsToRecomendedGifts } from "../_shared/domain/entities/recommended-gifts.ts";
import { insertRecommendedGiftIntoDatabase } from "../_shared/service/recommended-gifts-service.ts";
import { createSupabaseClient } from "../_shared/domain/utils/supabase.ts";
import { corsHeaders } from "../_shared/cors.ts";

const recommendedAmount = 6;
const recommendationTemplate = `
  Quero uma recomendação de [recommendedAmount] presentes criativos para meu [relationship] de [age] anos. 
  As características dele(a) são: [characteristics]. 
  A recomendação deverá ser personalizada, considerando o mercado no Brasil e focada em algo útil e criativo para o dia a dia. 
  Por favor, retorne apenas um array de objetos em formato JSON, com os seguintes campos: 
  - name: nome do presente;
  - description: descrição detalhada, explicando por que esse presente seria uma boa escolha com base nas características fornecidas;
  Exemplo da resposta:
  "[
    {
      "name": "Nome do presente",
      "description": "Descrição detalhada do presente, como ele se encaixa nas preferências e como seria útil."
    }
  ]";
  É importante retornar apenas o JSON, sem quaisquer outra forma que gere exceção ao utilizar um JSON.parse();
  A recomendação deve ser atenciosa e cuidadosa, abordando todas as características mencionadas. Muito obrigado!
`;

interface RecommendedGiftRequest {
  relationship: string;
  age: number;
  characteristics: string;
  birthday_id: number;
}

Deno.serve(async (req) => {
  const cors = {
    ...corsHeaders,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  try {
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: cors });
    }

    if (req.method !== "POST") {
      return new Response("METHOD NOT ALLOWED", { status: 405, headers: cors });
    }

    const body: RecommendedGiftRequest = await req.json();
    const authHeader = req.headers.get("Authorization");
    console.log(authHeader);
    const supabase = createSupabaseClient(authHeader!);

    if (!isBodyValid(body)) {
      return new Response("Body is invalid", { status: 400, headers: cors });
    }

    const query = generateRecommendation(
      body.relationship,
      body.age,
      body.characteristics,
    );
    const recommendations = await requestRecommendedGiftOpenIA(query);
    const recommendationArray = JSON.parse(recommendations ?? "[]");

    if (!Array.isArray(recommendationArray)) {
      throw new Error("The recommendations data should be an array of objects");
    }

    const gifts = parseObjectsToRecomendedGifts(
      recommendationArray,
      body.birthday_id,
    );

    const data = await insertRecommendedGiftIntoDatabase(
      supabase,
      gifts.map((gift) => ({
        name: gift.name,
        description: gift.description,
        birthday_id: gift.birthday_id,
      })),
    );

    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json", ...cors },
      status: 200,
    });
  } catch (e) {
    console.error(e);
    return new Response("INTERNAL SERVER ERROR", {
      status: 500,
      headers: corsHeaders,
    });
  }
});

const isBodyValid = (body: RecommendedGiftRequest) => {
  return (
    typeof body.relationship === "string" &&
    typeof body.age === "number" &&
    typeof body.characteristics === "string" &&
    typeof body.birthday_id === "number"
  );
};

const generateRecommendation = (
  relationship: string,
  age: number,
  characteristics: string,
): string => {
  return recommendationTemplate
    .replace("[recommendedAmount]", recommendedAmount.toString())
    .replace("[relationship]", relationship)
    .replace("[age]", age.toString())
    .replace("[characteristics]", characteristics)
    .trim();
};
