using ECommerce.Application.Features.Carts.DTOs;
using MediatR;

namespace ECommerce.Application.Features.Carts.Queries.GetCart;

public sealed record GetCartQuery : IRequest<CartDto>;