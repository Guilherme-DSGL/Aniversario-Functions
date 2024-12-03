export interface RecommendedGifts {
    id: number | undefined;
    name: string;
    description: string;
    birthday_id: number;
}


// deno-lint-ignore no-explicit-any
export const  parseObjectsToRecomendedGifts = (array: any[], birthday_id?: number): RecommendedGifts[] => {
  return array.map(item => ({
    id: item.id,
    name: item.name,
    description: item.description,
    birthday_id: birthday_id ?? item.birthday_id,
  }));
};