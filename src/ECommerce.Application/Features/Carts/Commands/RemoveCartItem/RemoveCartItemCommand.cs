using MediatR;

namespace ECommerce.Application.Features.Carts.Commands.RemoveCartItem
{
    public sealed record RemoveCartItemCommand(
        int ProductId
    ) : IRequest;
}