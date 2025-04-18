import React from 'react';

interface Props {
  children: React.ReactNode;
  isDarkMode?: boolean;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={this.props.isDarkMode ? 'dark' : 'light'}>
          <h2>Something went wrong. Please try again.</h2>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
