namespace ECommerce.Application.Features.Dashboard.DTOs
{
    public sealed record TopProductDto(
       int ProductId,
       string ProductName,
       int UnitsSold,
       decimal Revenue);
}