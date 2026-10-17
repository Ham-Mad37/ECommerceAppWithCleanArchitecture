using MediatR;
namespace ECommerce.Application.Features.Products.Commands.CreateProduct;

public sealed record CreateProductCommand(string Name, string? Description, decimal Price, int StockQuantity, int CategoryId) : IRequest<int>;
