import { Component } from "react";

export class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught Error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-900 p-6 text-center">
                    <h1 className="text-4xl font-bold text-[#ca0002] mb-4">Something went wrong.</h1>
                    <p className="text-gray-500 mb-6 max-w-lg">
                        The application encountered an unexpected error.
                        <br />
                        <span className="text-xs font-mono bg-gray-100 p-1 rounded mt-2 inline-block">
                            {this.state.error && this.state.error.toString()}
                        </span>
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-[#ca0002] hover:bg-[#a00002] text-white px-6 py-3 rounded-lg font-bold transition"
                    >
                        Reload Application
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
