using MediatR;
namespace ECommerce.Application.Features.Products.Commands.CreateProduct;

public sealed record CreateProductCommand(string name, string? description, decimal price, int StockQuantity, int categoryId) : IRequest<int>;
