using MediatR;

namespace ECommerce.Application.Features.Products.Commands.ActivateProduct
{
    public sealed record ActivateProductCommand(int id) : IRequest;
}