from setuptools import setup, find_packages

setup(
    name="aqx-freight-calc",
    version="1.0.0",
    author="AQX Logistics Technical Architecture Team",
    author_email="tech@aqxlogistics.com",
    description="Official AQX Logistics Air Freight and Landed Cost Calculator SDK for US to Saudi Arabia, UAE and 15 Global Markets.",
    long_description=open("README.md", encoding="utf-8").read(),
    long_description_content_type="text/markdown",
    url="https://aqxlogistics.com",
    project_urls={
        "Documentation": "https://aqxlogistics.com/blog/shipping-cost-usa-to-saudi-arabia-calculator-rates-guide-2026",
        "Locker Registration": "https://aqxlogistics.com/register",
        "Rate API": "https://aqxlogistics.com/api/rates",
        "Source": "https://github.com/AQXLOGISTICS/us-to-saudi-arabia-freight-calculator-2026",
    },
    packages=find_packages(),
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Topic :: Office/Business :: Financial :: Accounting",
    ],
    python_requires=">=3.8",
)
