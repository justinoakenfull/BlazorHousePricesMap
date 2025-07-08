using HousePrices.Models;
using HousePrices.Services.Interfaces;

namespace HousePrices.Services
{
    public class PropertyDataService : IPropertyDataService
    {
        public Task<List<PropertyHeatmapPoint>> GetHeatmapDataAsync(string region)
        {
            throw new NotImplementedException();
        }

        public Task<MapLayerData> GetMapLayerDataAsync(string region)
        {
            throw new NotImplementedException();
        }

        public Task<List<Property>> GetPropertiesAsync(string region)
        {
            throw new NotImplementedException();
        }

        public Task<Property?> GetPropertyByIdAsync(string propertyId)
        {
            throw new NotImplementedException();
        }

        public Task<List<Property>> SearchPropertiesAsync(PropertySearchCriteria criteria)
        {
            throw new NotImplementedException();
        }
    }
}
