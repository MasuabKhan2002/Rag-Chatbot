import React from 'react';
import { render, screen } from '@testing-library/react';
import LoadingScreen from '../../../Components/signin/LoadingScreen';

describe('LoadingScreen', () => {
    test('renders loading screen with spinner icon', () => {
        render(<LoadingScreen />);
        
        const spinnerIconElement = screen.getByLabelText('loading screen');
        expect(spinnerIconElement).toBeInTheDocument();
    });
});