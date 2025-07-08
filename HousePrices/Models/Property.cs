namespace HousePrices.Models
{
    public class Property
    {
        //Identification details
        public string ID { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;

        //Location details
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string Suburb { get; set; } = string.Empty;
        public string State { get; set; } = string.Empty;
        public string PostCode { get; set; } = string.Empty;

        //Property details
        public int Bedrooms { get; set; }
        public int Bathrooms { get; set; }
        public int CarSpaces { get; set; }
        public PropertyType PropertyType { get; set; } = PropertyType.Unknown;
        public double? LandSize { get; set; } // in square meters
        public double? FloorSize { get; set; } // in square meters

        //Listing Details
        public decimal Price { get; set; }
        public DateTime ListingDate { get; set; }
        public ListingType ListingType { get; set; } = ListingType.Unknown;
        public string? Description { get; set; } = string.Empty;

        //Agent details - very optional
        public string? AgentName { get; set; } = string.Empty;
        public string? AgencyName { get; set; } = string.Empty;

        public string PriceCategory => Price switch
        {
            < 500_000 => "Budget",
            < 1_000_000 => "Mid-range",
            < 2_000_000 => "Premium",
            _ => "Luxury"
        };

        public string MarkerColor => PriceCategory switch
        {
            "Budget" => "green",
            "Mid-range" => "blue",
            "Premium" => "orange",
            "Luxury" => "red",
            _ => "gray"
        };

        public double HeatmapIntensity => Math.Min(1.0, (double)Price / 3_000_000);

        public string PopupText => $@"
        <strong>{Address}</strong><br/>
        Price: {Price:C}<br/>
        {Bedrooms}bed {Bathrooms}bath<br/>
        {PropertyType}
    ";

        // Helper methods
        public bool IsNewListing => ListingDate > DateTime.Now.AddDays(-30);

        public string GetPricePerSqm()
        {
            if (FloorSize.HasValue && FloorSize > 0)
                return $"{Price / (decimal)FloorSize.Value:C0}/m²";
            return "N/A";
        }
    }

    public enum PropertyType
    {
        House,
        Apartment,
        Townhouse,
        Villa,
        Unit,
        Duplex,
        Studio,
        Other,
        Unknown
    }

    public enum  ListingType
    {
        Sale,
        Rent,
        Sold,
        Auction,
        Unknown
    }
}
