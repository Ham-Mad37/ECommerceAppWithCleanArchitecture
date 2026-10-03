using ECommerce.API.Contracts.Carts;
using ECommerce.Application.Features.Carts.ClearCart;
using ECommerce.Application.Features.Carts.Commands.AddCartItem;
using ECommerce.Application.Features.Carts.Commands.RemoveCartItem;
using ECommerce.Application.Features.Carts.Commands.UpdateCartItem;
using ECommerce.Application.Features.Carts.Queries.GetCart;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public sealed class CartController : ControllerBase
{
    private readonly IMediator _mediator;
    public CartController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetCart()
    {
        var query = new GetCartQuery();
        var cart = await _mediator.Send(query);
        return Ok(cart);
    }

    [HttpPost("items")]
    public async Task<IActionResult> AddItem([FromBody] AddCartItemCommand command, CancellationToken cancellationToken)
    {
        await _mediator.Send(command, cancellationToken);
        return NoContent();
    }

    [HttpPut("items/{productId:int}")]
    public async Task<IActionResult> UpdateItem(int productId, [FromBody] UpdateCartItemRequest request, CancellationToken cancellationToken)
    {

        await _mediator.Send(new UpdateCartItemCommand(productId, request.Quantity), cancellationToken);

        return NoContent();
    }
    [HttpDelete("items/{productId:int}")]
    public async Task<IActionResult> RemoveItem(int productId, CancellationToken cancellationToken)
    {
        await _mediator.Send(new RemoveCartItemCommand(productId), cancellationToken);
        return NoContent();
    }
    [HttpDelete]
    public async Task<IActionResult> ClearCart(CancellationToken cancellationToken)
    {
        await _mediator.Send(new ClearCartCommand(), cancellationToken);
        
        return NoContent();
    }
}