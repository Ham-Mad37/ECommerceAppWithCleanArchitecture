using ECommerce.Application.Features.Categories.Command;
using ECommerce.Application.Features.Categories.Command.ActivateCategory;
using ECommerce.Application.Features.Categories.Command.CreateCategory;
using ECommerce.Application.Features.Categories.Command.DeactivateCategory;
using ECommerce.Application.Features.Categories.Command.UpdateCategoryCommand;
using ECommerce.Application.Features.Categories.Queries.GetCategoriesQuery;
using ECommerce.Application.Features.Categories.Queries.GetCategoryById;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace ECommerce.API.Controller
{
    [ApiController]
    [Route("api/[controller]")]
    public sealed class CategoriesController:ControllerBase
    {
        private readonly IMediator  _mediator;
        public CategoriesController(IMediator mediator)
        {
            _mediator = mediator;
        }
        //GET: api/categories
        [HttpGet]
        public async Task<IActionResult> GetCategories(CancellationToken cancellationToken)
        {
            var query = new GetCategoriesQuery();

            var result = await _mediator.Send(query, cancellationToken);

            return Ok(result);
        }

        //Get: api/categories/5
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetCategoryById(int id, CancellationToken cancellationToken)
        {
            var query = new GetCategoryByIdQuery(id);

            var result = await _mediator.Send(query, cancellationToken);

            if (result is null)
                return NotFound();

            return Ok(result);
        }
        //POST: api/categories
        [HttpPost]
        public async Task<IActionResult> CreateCategory([FromBody] CreateCategoryCommand command, CancellationToken cancellationToken)
        {
            var categoryId = await _mediator.Send(command, cancellationToken);

            return CreatedAtAction(nameof(GetCategoryById), new { id = categoryId }, new { id = categoryId });

        }
        //PUT: api/categories
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCategory(int id, [FromBody] UpdateCategoryCommand command, CancellationToken cancellationToken)
        {
            if (id != command.Id)
                return BadRequest("Route ID dose not match category ID.");
            await _mediator.Send(command, cancellationToken);
            return NoContent();
        }

        //PATCH: api/categories
        [HttpPatch("{id:int}/activate")]
        public async Task<IActionResult> ActivateCategory(int id, CancellationToken cancellationToken)
        {
            var commad = new ActivateCategoryCommand(id);

            await _mediator.Send(commad, cancellationToken);
            
            return NoContent();
        }
        //PATCH: api/categories
        [HttpPatch("{id:int}/deactivate")]
        public async Task<IActionResult> DeactivateCategory(int id,CancellationToken cancellationToken)
        {
            var command = new DeactivateCategoryCommand(id);

            await _mediator.Send(command, cancellationToken);

            return NoContent();
        }
    }
}