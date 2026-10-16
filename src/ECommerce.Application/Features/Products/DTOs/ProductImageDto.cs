namespace ECommerce.Application.Features.Products.DTOs
{
    public sealed record ProductImageDto(int Id, string Url, bool IsPrimary, int SortOrder);
}