export type MatrixJson = {
    status?: string;
    error_message?: string;
    rows?: { elements?: { status?: string; distance?: { value: number } }[] }[];
  };
