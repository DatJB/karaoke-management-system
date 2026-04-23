package com.karaoke.backend.dto.response;

import lombok.Builder;
import java.util.List;
import lombok.Data;


@Data
@Builder
public class PageResponse<T>
{
    private int currentPage;
    private int totalPages;
    private int pageSize;
    private long totalElements;
    private List<T> data;
}
