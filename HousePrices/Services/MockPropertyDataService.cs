using HousePrices.Models;
using HousePrices.Services.Interfaces;
using System.Runtime.Serialization;

namespace HousePrices.Services
{
    public class MockPropertyDataService : IPropertyDataService
    {
        private readonly Random _random = new();

        public async Task<List<Property>> GetPropertiesAsync(string region)
        {
            // Simulate API delay
            await Task.Delay(500);

            return GenerateMockProperties(region, 100);
        }

        public async Task<List<PropertyHeatmapPoint>> GetHeatmapDataAsync(string region)
        {
            await Task.Delay(300);

            var (centerLat, centerLng) = GetRegionCenter(region);
            var basePrice = GetRegionBasePrice(region);

            return Enumerable.Range(0, 500)
                .Select(_ => new PropertyHeatmapPoint
                {
                    Lat = centerLat + (_random.NextDouble() - 0.5) * 0.3,
                    Lng = centerLng + (_random.NextDouble() - 0.5) * 0.3,
                    Intensity = CalculateHeatmapIntensity(basePrice)
                })
                .ToList();
        }

        public async Task<MapLayerData> GetMapLayerDataAsync(string region)
        {
            var properties = await GetPropertiesAsync(region);
            var heatmapData = await GetHeatmapDataAsync(region);

            var markers = properties.Select(p => new PropertyMarker
            {
                Lat = p.Latitude,
                Lng = p.Longitude,
                Colour = p.MarkerColor,
                PopupText = p.PopupText,
                Price = p.Price
            }).ToList();

            return new MapLayerData
            {
                Markers = markers,
                HeatmapPoints = heatmapData,
                Region = region,
                AveragePrice = properties.Average(p => p.Price),
                TotalProperties = properties.Count
            };
        }

        public async Task<List<Property>> SearchPropertiesAsync(PropertySearchCriteria criteria)
        {
            var allProperties = await GetPropertiesAsync(criteria.Region ?? "Sydney");

            return allProperties.Where(p =>
                (criteria.MinPrice == null || p.Price >= criteria.MinPrice) &&
                (criteria.MaxPrice == null || p.Price <= criteria.MaxPrice) &&
                (criteria.MinBedrooms == null || p.Bedrooms >= criteria.MinBedrooms) &&
                (criteria.MaxBedrooms == null || p.Bedrooms <= criteria.MaxBedrooms) &&
                (criteria.PropertyType == null || p.PropertyType.Equals(criteria.PropertyType)) &&
                (criteria.ListingType == null || p.ListingType.Equals(criteria.ListingType))
            ).ToList();
        }

        public async Task<Property?> GetPropertyByIdAsync(string propertyId)
        {
            await Task.Delay(200);

            // Return a mock property with the specified ID
            return GenerateMockProperties("Sydney", 1).FirstOrDefault()?.Let(p =>
            {
                p.ID = propertyId;
                return p;
            });
        }

        private List<Property> GenerateMockProperties(string region, int count)
        {
            var (centerLat, centerLng) = GetRegionCenter(region);
            var basePrice = GetRegionBasePrice(region);
            var suburbs = GetRegionSuburbs(region);
            var propertyTypes = Enum.GetValues<PropertyType>();
            var listingTypes = Enum.GetValues<ListingType>();

            return Enumerable.Range(0, count)
                .Select(i => new Property
                {
                    ID = Guid.NewGuid().ToString(),
                    Address = GenerateAddress(i),
                    Latitude = centerLat + (_random.NextDouble() - 0.5) * 0.3,
                    Longitude = centerLng + (_random.NextDouble() - 0.5) * 0.3,
                    Suburb = suburbs[_random.Next(suburbs.Length)],
                    State = GetStateForRegion(region),
                    PostCode = GeneratePostcode(region),
                    Price = GeneratePrice(basePrice),
                    Bedrooms = _random.Next(1, 6),
                    Bathrooms = _random.Next(1, 4),
                    CarSpaces = _random.Next(0, 3),
                    PropertyType = propertyTypes[new Random().Next(propertyTypes.Length)],
                    LandSize = _random.Next(200, 1000),
                    FloorSize = _random.Next(80, 350),
                    ListingDate = DateTime.Now.AddDays(-_random.Next(0, 365)),
                    ListingType = listingTypes[new Random().Next(listingTypes.Length)],
                    Description = "Beautiful property in great location with modern amenities.",
                    AgentName = $"Agent {i % 10 + 1}",
                    AgencyName = $"Real Estate Agency {i % 5 + 1}"
                })
                .ToList();
        }

        private (double lat, double lng) GetRegionCenter(string region) => region.ToLower() switch
        {
            "sydney" => (-33.8688, 151.2093),
            "melbourne" => (-37.8136, 144.9631),
            "brisbane" => (-27.4698, 153.0251),
            "perth" => (-31.9505, 115.8605),
            "adelaide" => (-34.9285, 138.6007),
            _ => (-33.8688, 151.2093) // Default to Sydney
        };

        private decimal GetRegionBasePrice(string region) => region.ToLower() switch
        {
            "sydney" => 1_200_000m,
            "melbourne" => 950_000m,
            "brisbane" => 750_000m,
            "perth" => 650_000m,
            "adelaide" => 600_000m,
            _ => 800_000m
        };

        private string[] GetRegionSuburbs(string region) => region.ToLower() switch
        {
            "sydney" => new[] { "Bondi", "Surry Hills", "Paddington", "Newtown", "Manly", "Chatswood", "Parramatta" },
            "melbourne" => new[] { "Richmond", "Fitzroy", "St Kilda", "Prahran", "Carlton", "Toorak", "South Yarra" },
            "brisbane" => new[] { "Fortitude Valley", "New Farm", "West End", "Paddington", "Kangaroo Point", "Teneriffe" },
            _ => new[] { "Central", "North", "South", "East", "West" }
        };

        private string GetStateForRegion(string region) => region.ToLower() switch
        {
            "sydney" => "NSW",
            "melbourne" => "VIC",
            "brisbane" => "QLD",
            "perth" => "WA",
            "adelaide" => "SA",
            _ => "NSW"
        };

        private string GeneratePostcode(string region) => region.ToLower() switch
        {
            "sydney" => (2000 + _random.Next(0, 300)).ToString(),
            "melbourne" => (3000 + _random.Next(0, 200)).ToString(),
            "brisbane" => (4000 + _random.Next(0, 200)).ToString(),
            _ => "2000"
        };

        private string GenerateAddress(int index) =>
            $"{_random.Next(1, 999)} {GetStreetName()} {GetStreetType()}";

        private string GetStreetName() => new[]
        {
        "George", "King", "Queen", "Elizabeth", "Collins", "Flinders", "Bourke", "Little", "Spring", "Summer"
    }[_random.Next(10)];

        private string GetStreetType() => new[]
        {
        "Street", "Road", "Avenue", "Lane", "Drive", "Court", "Place"
    }[_random.Next(7)];

        private decimal GeneratePrice(decimal basePrice)
        {
            var variance = _random.NextDouble() * 0.8 + 0.6; // 60% to 140% of base price
            return Math.Round(basePrice * (decimal)variance / 10000) * 10000; // Round to nearest 10k
        }

        private double CalculateHeatmapIntensity(decimal basePrice)
        {
            var price = GeneratePrice(basePrice);
            return Math.Min(1.0, (double)price / 3_000_000);
        }
    }

    public static class Extensions
    {
        public static T Let<T>(this T obj, Func<T, T> func) => func(obj);
    }
}
