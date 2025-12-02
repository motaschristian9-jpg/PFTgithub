<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;
use Illuminate\Pagination\AbstractPaginator;

class TransactionCollection extends ResourceCollection
{
    public function toArray(Request $request): array
    {
        // Check if the resource is a Paginator (has pages)
        if ($this->resource instanceof AbstractPaginator) {
            return [
                'data' => $this->collection,
                'links' => [
                    'first' => $this->url(1),
                    'last' => $this->url($this->lastPage()),
                    'prev' => $this->previousPageUrl(),
                    'next' => $this->nextPageUrl(),
                ],
                'meta' => [
                    'current_page' => $this->currentPage(),
                    'from' => $this->firstItem(),
                    'last_page' => $this->lastPage(),
                    'links' => $this->linkCollection(),
                    'path' => $this->path(),
                    'per_page' => $this->perPage(),
                    'to' => $this->lastItem(),
                    'total' => $this->total(),
                ],
            ];
        }

        // If it's a regular Collection (when ?all=true), just return the data
        return [
            'data' => $this->collection,
        ];
    }
}