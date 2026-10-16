using MediatR;

namespace ECommerce.Application.Features.Products.Commands.SetPrimaryProductImage
{
    public sealed record SetPrimaryProductImageCommand(int ProductId, int ImageId) : IRequest;
}