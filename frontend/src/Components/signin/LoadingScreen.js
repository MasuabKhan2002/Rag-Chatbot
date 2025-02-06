import React from 'react';

function LoadingScreen() {
    return (
        <div aria-label='loading screen' style={styles.container}>
            <i className="pi pi-spin pi-spinner" style={styles.icon}></i>
        </div>
    );
}

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999
    },
    icon: {
        fontSize: '2rem',
        color: '#ffffff'
    }
};

export default LoadingScreen;