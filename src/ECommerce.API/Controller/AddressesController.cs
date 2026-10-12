using ECommerce.Application.Common.Constants;
using ECommerce.Application.Features.Addresses.Commands.AddAddress;
using ECommerce.Application.Features.Addresses.Commands.DeleteAddress;
using ECommerce.Application.Features.Addresses.Commands.SetDefaultAddress;
using ECommerce.Application.Features.Addresses.Commands.UpdateAddress;
using ECommerce.Application.Features.Addresses.Queries.GetMyAddresses;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controller
{
    [Authorize(Roles = Roles.Customer)]
    [ApiController]
    [Route("api/[controller]")]
    public sealed class AddressesController : ControllerBase
    {
        private readonly IMediator _mediator;
        public AddressesController(IMediator mediator) => _mediator = mediator;

        // GET: api/addresses
        [HttpGet]
        public async Task<IActionResult> GetMyAddresses(CancellationToken cancellationToken)
            => Ok(await _mediator.Send(new GetMyAddressesQuery(), cancellationToken));

        // POST: api/addresses
        [HttpPost]
        public async Task<IActionResult> AddAddress([FromBody] AddAddressCommand command, CancellationToken cancellationToken)
        {
            var id = await _mediator.Send(command, cancellationToken);
            return Ok(new { id });
        }

        // PUT: api/addresses/5
        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateAddress(int id, [FromBody] UpdateAddressCommand command, CancellationToken cancellationToken)
        {
            if (id != command.Id)
                return BadRequest("Route ID does not match address ID.");
            await _mediator.Send(command, cancellationToken);
            return NoContent();
        }

        // PATCH: api/addresses/5/default
        [HttpPatch("{id:int}/default")]
        public async Task<IActionResult> SetDefault(int id, CancellationToken cancellationToken)
        {
            await _mediator.Send(new SetDefaultAddressCommand(id), cancellationToken);
            return NoContent();
        }

        // DELETE: api/addresses/5
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteAddress(int id, CancellationToken cancellationToken)
        {
            await _mediator.Send(new DeleteAddressCommand(id), cancellationToken);
            return NoContent();
        }
    }
}