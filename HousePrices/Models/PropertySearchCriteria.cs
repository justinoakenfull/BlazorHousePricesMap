namespace HousePrices.Models
{
    public class PropertySearchCriteria
    {
        public string? Region { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
        public int? MinBedrooms { get; set; }
        public int? MaxBedrooms { get; set; }
        public string? PropertyType { get; set; }
        public string? ListingType { get; set; } = "Sale"; // Sale, Rent, Sold
    }
}
