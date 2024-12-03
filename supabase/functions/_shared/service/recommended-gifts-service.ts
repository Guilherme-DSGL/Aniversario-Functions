import SupabaseClient from "https://esm.sh/v135/@supabase/supabase-js@2.46.1/dist/module/SupabaseClient.js";

interface RecommendedGiftCreate {
  name: string;
  description: string;
  birthday_id: number;
}
export const insertRecommendedGiftIntoDatabase = async (
  supabase: SupabaseClient,
  gifts: RecommendedGiftCreate[],
) => {
  const { data, error } = await supabase
    .from("recommended_gifts")
    .insert(gifts)
    .select();

  if (error) {
    console.log(error);
    throw new Error("Erro ao inserir dados na tabela recommended_gifts", error);
  }

  if (data?.length > 0) {
    return data;
  } else {
    return requestLastRecommendedGifts({
      supabase: supabase,
      limit: 6,
      birthday_id: gifts[0].birthday_id,
    });
  }
};

const requestLastRecommendedGifts = async (
  params: {
    supabase: SupabaseClient;
    limit: number;
    birthday_id: number;
  },
) => {
  const { data, error } = await params.supabase
    .from("recommended_gifts")
    .select()
    .eq("birthday_id", params.birthday_id)
    .order("updated_at", { ascending: true })
    .order("created_at", { ascending: true })
    .limit(params.limit);

  if (error) {
    throw new Error("Erro ao buscar dados na tabela recommended_gifts", error);
  }
  return data;
};
