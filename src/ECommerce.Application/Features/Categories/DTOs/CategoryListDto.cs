namespace ECommerce.Application.Features.Categories.DTOs
{
    public sealed record CategoryListDto(
        int Id,
        string Name,
        bool IsActive
    );
}