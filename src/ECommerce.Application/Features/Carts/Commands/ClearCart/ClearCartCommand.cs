using MediatR;

namespace ECommerce.Application.Features.Carts.ClearCart
{
    public sealed record ClearCartCommand() : IRequest;
}