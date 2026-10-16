using ECommerce.Application.Features.Products.DTOs;
using MediatR;

public sealed record AddProductImageCommand(
       int ProductId,
       Stream Content,
       string FileName,
       string ContentType,
       long Length) : IRequest<ProductImageDto>;