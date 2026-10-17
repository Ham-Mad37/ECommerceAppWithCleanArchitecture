using MediatR;

namespace ECommerce.Application.Common.Features.Products.Command.UpdateProduct
{
    public sealed record UpdateProductCommand(
        int Id,
        string Name,
        string Description,
        decimal Price,
        int StockQuantity,
        int CategoryId) : IRequest;
}