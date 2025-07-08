namespace HousePrices.Models
{
    public class MapLayerData
    {
        public List<PropertyMarker> Markers { get; set; } = new();
        public List<PropertyHeatmapPoint> HeatmapPoints { get; set; } = new();
        public string Region { get; set; } = string.Empty;
        public decimal AveragePrice { get; set; }
        public int TotalProperties { get; set; }
    }
}
