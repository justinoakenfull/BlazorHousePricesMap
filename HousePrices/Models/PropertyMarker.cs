namespace HousePrices.Models
{
    public class PropertyMarker
    {
        public double Lat { get; set; }
        public double Lng { get; set; }
        public string Colour { get; set; } = string.Empty;
        public string PopupText { get; set; } = string.Empty;
        public decimal Price { get; set; }
    }
}
