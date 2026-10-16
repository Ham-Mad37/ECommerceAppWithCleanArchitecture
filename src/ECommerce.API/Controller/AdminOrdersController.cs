using ECommerce.Application.Common.Constants;
using ECommerce.Application.Features.Orders.Admin.GetOrderForAdmin;
using ECommerce.Application.Features.Orders.Commands.ConfirmOrder;
using ECommerce.Application.Features.Orders.Commands.DeliverOrder;
using ECommerce.Application.Features.Orders.Commands.ShipOrder;
using ECommerce.Application.Features.Orders.Commands.StartProcessingOrder;
using ECommerce.Application.Features.Products.Commands.AdjustProductStock;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.Application.Controller;

[ApiController]
[Route("api/admin/orders")]
[Authorize(Roles = Roles.Admin)]
public sealed class AdminOrdersController : ControllerBase
{
    private readonly IMediator _mediator;
    public AdminOrdersController(IMediator mediator)
    {
        _mediator = mediator;
    }

    // GET: api/admin/orders
    // Get all orders
    [HttpGet]
    public async Task<IActionResult> GetAllOrders([FromQuery] GetAllOrdersQuery  query , CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(query, cancellationToken);

        return Ok(result);
    }

    // PUT: api/admin/orders/5/confirm
    [HttpPut("{id:int}/confirm")]
    public async Task<IActionResult> Confirm(int id, CancellationToken cancellationToken)
    {
        await _mediator.Send(new ConfirmOrderCommand(id), cancellationToken);

        return NoContent();
    }

    // PUT: api/admin/orders/5/processing
    [HttpPut("{id:int}/processing")]
    public async Task<IActionResult> Processing(int id, CancellationToken cancellationToken)
    {
        await _mediator.Send(new StartProcessingOrderCommand(id), cancellationToken);
        return NoContent();
    }

    // PUT: api/admin/orders/5/ship
    [HttpPut("{id:int}/ship")]
    public async Task<IActionResult> Ship(int id, CancellationToken cancellationToken)
    {
        await _mediator.Send(new ShipOrderCommand(id), cancellationToken);
        return NoContent();
    }

    // PUT: api/admin/orders/5/deliver
    [HttpPut("{id:int}/deliver")]
    public async Task<IActionResult> Deliver(int id, CancellationToken cancellationToken)
    {
        await _mediator.Send(new DeliverOrderCommand(id), cancellationToken);
        return NoContent();
    }

    // GET: api/admin/orders/5
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetOrder(int id, CancellationToken cancellationToken)
        => Ok(await _mediator.Send(new GetOrderForAdminQuery(id), cancellationToken));

}