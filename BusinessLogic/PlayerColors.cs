namespace CocaineCartels.BusinessLogic
{
    internal class PlayerData
    {
        public PlayerData(string color, string name)
        {
            Color = color;
            Name = name;
        }

        public string Color { get; }
        public string Name { get; }
    }
}
