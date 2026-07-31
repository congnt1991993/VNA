import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-red-50 text-red-800 rounded-xl border border-red-200 max-w-4xl mx-auto my-12 text-left shadow-lg">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-red-750">
            ⚠️ Đã xảy ra lỗi giao diện (React Render Error)
          </h2>
          <p className="text-sm font-semibold mb-2">Thông tin lỗi:</p>
          <pre className="p-4 bg-red-100/50 rounded-lg text-xs font-mono overflow-auto mb-4 border border-red-200 text-red-900">
            {this.state.error?.toString()}
          </pre>
          {this.state.errorInfo && (
            <>
              <p className="text-sm font-semibold mb-2">Chi tiết Stack Trace:</p>
              <pre className="p-4 bg-red-100/50 rounded-lg text-xs font-mono overflow-auto max-h-[300px] border border-red-200 text-red-900">
                {this.state.errorInfo.componentStack}
              </pre>
            </>
          )}
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-700 text-white font-bold rounded-lg text-sm hover:bg-red-800 transition-colors shadow-sm cursor-pointer"
          >
            Tải lại trang
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
