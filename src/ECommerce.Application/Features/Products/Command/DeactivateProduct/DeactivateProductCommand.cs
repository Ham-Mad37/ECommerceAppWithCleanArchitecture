using MediatR;

namespace ECommerce.Application.Features.Products.Commands.DeactivateProduct
{
    public sealed record DeactivateProductComman(int id) : IRequest;
}