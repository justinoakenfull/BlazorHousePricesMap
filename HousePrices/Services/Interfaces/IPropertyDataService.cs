using HousePrices.Models;

namespace HousePrices.Services.Interfaces
{
    public interface IPropertyDataService
    {
        Task<List<Property>> GetPropertiesAsync(string region);
        Task<List<PropertyHeatmapPoint>> GetHeatmapDataAsync(string region);
        Task<MapLayerData> GetMapLayerDataAsync(string region);
        Task<List<Property>> SearchPropertiesAsync(PropertySearchCriteria criteria);
        Task<Property?> GetPropertyByIdAsync(string propertyId);
    }
}
