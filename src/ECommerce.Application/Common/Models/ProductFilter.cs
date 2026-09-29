namespace ECommerce.Application.Common.Models;
public sealed record ProductFilter(
    string? Search,
    int? CategoryId,
    bool? IsActive,
    string SortBy,
    string SortDirection);