import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px

# Set page configuration
st.set_page_config(page_title="ShipPlug Audit", layout="wide")

# Display logo
st.image("https://raw.githubusercontent.com/yourusername/ShipPlug-Audit/main/src/assets/shipplug-logo.png", width=200)

st.title("ShipPlug Fulfillment Pricing Audit")

# File upload
st.subheader("Upload your fulfillment pricing files")
uploaded_file = st.file_uploader("Choose a CSV file", type="csv")

# Generate sample data function
def generate_sample_data():
    shipping_types = ['standard', 'express', 'overnight', 'international']
    agreed_pricing = {
        'standard': 5.99,
        'express': 12.99,
        'overnight': 24.99,
        'international': 35.99
    }
    
    data = []
    for _ in range(10000):
        shipping_type = np.random.choice(shipping_types)
        agreed_price = agreed_pricing[shipping_type]
        actual_price = agreed_price + np.random.uniform(-1, 4)
        surcharge = np.random.uniform(0, 2) if np.random.random() < 0.3 else 0
        
        data.append({
            'type': shipping_type,
            'agreed_price': agreed_price,
            'actual_price': actual_price,
            'surcharge': surcharge
        })
    
    return pd.DataFrame(data)

# Analyze data function
def analyze_data(df):
    df['total_price'] = df['actual_price'] + df['surcharge']
    df['difference'] = df['total_price'] - df['agreed_price']
    
    summary = df.groupby('type').agg({
        'difference': ['count', 'sum', 'mean'],
        'total_price': 'sum',
        'agreed_price': 'sum'
    })
    
    summary.columns = ['shipments', 'total_difference', 'avg_difference', 'total_actual', 'total_agreed']
    summary['potential_savings'] = summary['total_difference'].apply(lambda x: max(x, 0))
    
    return summary

# Main app logic
if uploaded_file is not None:
    df = pd.read_csv(uploaded_file)
    summary = analyze_data(df)
else:
    if st.button("Generate Sample Audit"):
        df = generate_sample_data()
        summary = analyze_data(df)
    else:
        st.stop()

# Display results
if 'summary' in locals():
    st.subheader("Summary Table")
    st.dataframe(summary)
    
    st.subheader("Total Difference by Shipping Type")
    fig = px.bar(summary.reset_index(), x='type', y='total_difference', 
                 labels={'type': 'Shipping Type', 'total_difference': 'Total Difference ($)'},
                 color='type')
    fig.update_layout(yaxis_range=[0, 6000])
    st.plotly_chart(fig)

    st.subheader("Overall Summary")
    total_shipments = summary['shipments'].sum()
    total_difference = summary['total_difference'].sum()
    potential_savings = summary['potential_savings'].sum()

    st.write(f"Total Shipments: {total_shipments}")
    st.write(f"Total Difference: ${total_difference:.2f}")
    st.write(f"Potential Savings: ${potential_savings:.2f}")