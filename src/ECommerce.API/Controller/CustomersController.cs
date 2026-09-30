using ECommerce.Application.Features.Customers.Command.CreateCustomer;
using ECommerce.Application.Features.Customers.Commands.ActivateCustomer;
using ECommerce.Application.Features.Customers.Commands.DeactivateCustomer;
using ECommerce.Application.Features.Customers.Commands.UpdateCustomer;
using ECommerce.Application.Features.Customers.Queries.GetCustomerById;
using ECommerce.Application.Features.Customers.Queries.GetCustomers;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class CustomersController : ControllerBase
{
    private readonly IMediator _mediator;

    public CustomersController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetCustomers(
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(
            new GetCustomersQuery(),
            cancellationToken);

        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetCustomerById(int id, CancellationToken cancellationToken)
    {
        var query = new GetCustomerByIdQuery(id);

        var result = await _mediator.Send(query, cancellationToken);

        if (result is null)

            return NotFound();

        return Ok(result);
    }
    [HttpPost]
    public async Task<IActionResult> CreateCustomer([FromBody] CreateCustomerCommand command, CancellationToken cancellationToken)
    {
        var customerId = await _mediator.Send(command, cancellationToken);

        return CreatedAtAction(nameof(GetCustomerById), new { id = customerId }, new { id = customerId });


    }
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateCustomer(int id, [FromBody] UpdateCustomerCommand command, CancellationToken cancellationToken)
    {
        if (id != command.Id)
        {
            return BadRequest("Id in the URL does not match Id in the request body.");
        }
        await _mediator.Send(command, cancellationToken);

        return NoContent();
    }
    [HttpPost("{id:int}/activate")]
    public async Task<IActionResult> ActivateCustomer(int id, CancellationToken cancellationToken)
    {
        var command = new ActivateCustomerCommand(id);
        await _mediator.Send(command, cancellationToken);

        return NoContent();
    }
    [HttpPost("{id:int}/deactivate")]
    public async Task<IActionResult> DeactivateCustomer(int id, CancellationToken cancellationToken)
    {
        var command = new DeactivateCustomerCommand(id);
        await _mediator.Send(command, cancellationToken);

        return NoContent();
    }
}