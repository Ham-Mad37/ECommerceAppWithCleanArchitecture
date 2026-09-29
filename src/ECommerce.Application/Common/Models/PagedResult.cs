namespace ECommerce.Application.Common.Modles;

public sealed class PagedResult<T>
{
    public IReadOnlyCollection<T> Items { get; init; }
    public int PageNumber { get; init; }
    public int PageSize { get; init; }
    public int TotalCount { get; init; }

    public int TotalPages =>
        (int)Math.Ceiling(TotalCount / (double)PageSize);

    public PagedResult(
        IReadOnlyCollection<T> items,
        int pageNumber,
        int pageSize,
        int totalCount)
    {
        Items = items;
        PageNumber = pageNumber;
        PageSize = pageSize;
        TotalCount = totalCount;
    }
}