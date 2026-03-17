export default function Loading() {
    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#F9FAFB',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '16px',
                }}
            >
                {/* Paw spinner */}
                <div
                    style={{
                        fontSize: '40px',
                        lineHeight: 1,
                        animation: 'spin 1s linear infinite',
                    }}
                >
                    🐾
                </div>
                <p
                    style={{
                        margin: 0,
                        fontSize: '14px',
                        color: '#9CA3AF',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                        letterSpacing: '0.3px',
                    }}
                >
                    Loading…
                </p>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
