using FluentValidation;
namespace ECommerce.Application.Features.Dashboard.Common
{
    public interface IDateRangeQuery
    {
        DateTime? From { get; }
        DateTime? To { get; }
    }

    public static class DashboardDateRange
    {
        // Defaults to the last 30 days. Both values are whole dates; end is inclusive.
        public static (DateTime Start, DateTime End) Resolve(DateTime? from, DateTime? to)
        {
            var end = (to ?? DateTime.UtcNow).Date;
            var start = (from ?? end.AddDays(-29)).Date;
            return (start, end);
        }
    }

    public abstract class DateRangeValidator<T> : AbstractValidator<T> where T : IDateRangeQuery
    {
        protected DateRangeValidator()
        {
            RuleFor(x => x)
                .Must(x =>
                {
                    var (start, end) = DashboardDateRange.Resolve(x.From, x.To);
                    return start <= end;
                })
                .OverridePropertyName("dateRange")
                .WithMessage("'From' must be earlier than or equal to 'To'.");

            RuleFor(x => x)
                .Must(x =>
                {
                    var (start, end) = DashboardDateRange.Resolve(x.From, x.To);
                    return (end - start).TotalDays <= 366;
                })
                .OverridePropertyName("dateRange")
                .WithMessage("The date range cannot exceed 366 days.");
        }
    }
}