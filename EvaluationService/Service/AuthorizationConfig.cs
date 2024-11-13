public static class AuthorizationConfig
{
   public static readonly Dictionary<int, List<int>> FunctionHabilitationAdminMap = new Dictionary<int, List<int>>
   {
       { 1, new List<int> { 1 } }, // ajouter une nouvelle évaluation
       { 2, new List<int> { 2 } }  // modifier une évaluation
   };
}