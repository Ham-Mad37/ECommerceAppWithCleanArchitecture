using MediatR;

namespace ECommerce.Application.Common.Features.Products.Command.UpdateProduct
{
    public sealed record UpdateProductCommand(
        int id,
        string name,
        string description,
        decimal price,
        int stcokQuantity,
        int categoryId) : IRequest;
}