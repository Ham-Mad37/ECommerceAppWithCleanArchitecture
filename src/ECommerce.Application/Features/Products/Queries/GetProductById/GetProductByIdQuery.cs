using ECommerce.Application.Features.Products.DTOs;
using MediatR;

namespace ECommerce.Application.Features.Products.Queries.GetProductById
{
    public sealed record GetProductByIdQuery(int id) : IRequest<ProductDto?>;
}