using MediatR;
namespace ECommerce.Application.Features.Products.Commands.DeleteProductImage
{
    public sealed record DeleteProductImageCommand(int ProductId, int ImageId) : IRequest;
}