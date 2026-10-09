using MediatR;

namespace ECommerce.Application.Features.Products.Commands.AdjustProductStock
{
    public sealed record AdjustProductStockCommand(
        int ProductId,
        int Quantity
    ) : IRequest;
}