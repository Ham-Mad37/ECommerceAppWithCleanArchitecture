using MediatR;

namespace ECommerce.Application.Features.Carts.Commands.AddCartItem
{
    public sealed record AddCartItemCommand(
        int productId,
        int Quantity
    ) : IRequest;
}