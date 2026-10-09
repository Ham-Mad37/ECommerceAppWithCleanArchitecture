using ECommerce.Application.Common.Constants;
using ECommerce.Application.Features.Orders.Commands.CancelOrder;
using ECommerce.Application.Features.Orders.Commands.ConfirmOrder;
using ECommerce.Application.Features.Orders.Commands.DeliverOrder;
using ECommerce.Application.Features.Orders.Commands.ShipOrder;
using ECommerce.Application.Features.Orders.Commands.StartProcessingOrder;
using ECommerce.Application.Features.Orders.CreateOrder;
using ECommerce.Application.Features.Orders.GetOrderById;
using ECommerce.Application.Features.Orders.Queries.GetOrder;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controller
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public sealed class OrdersController : ControllerBase
    {
        private readonly IMediator _mediator;
        public OrdersController(IMediator mediator)
        {
            _mediator = mediator;
        }
        // POST: api/Orders
        // Create an order from the current customer's cart
        [HttpPost]
        public async Task<IActionResult> CreateOrder(CancellationToken cancellationToken)
        {
            var orderId = await _mediator.Send(new CreateOrderCommand(), cancellationToken);
            return Ok(new
            {
                orderId
            });
        }
        // GET: api/Orders
        // Get current customer's orders
        [HttpGet]
        public async Task<IActionResult> GetAllOrders(CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(
                new GetOrdersQuery(),
                cancellationToken);

            return Ok(result);
        }
        
        // GET: api/Orders/5
        // Get one order belonging to the current customer
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetOrder(int id, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(
                new GetOrderByIdQuery(id),
                cancellationToken);

            return Ok(result);
        }

        // PUT: api/Orders/5/cancel
        // Customer cancels his own order
        [HttpPut("{id:int}/cancle")]
        public async Task<IActionResult> Cancle(int id, CancellationToken cancellationToken)
        {
            await _mediator.Send(new CancelOrderCommand(id), cancellationToken);
            return NoContent();
        }
    }
}