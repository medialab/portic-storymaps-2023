from setuptools import setup, find_packages

with open('./README.md', 'r') as f:
    long_description = f.read()

setup(name='marseillesprint',
      version='0.0.1',
      description='A library to facilitate data manipulation for the Dunkerque sprint!',
      long_description=long_description,
      long_description_content_type='text/markdown',
      url='http://github.com/medialab/portic-datasprint-2022',
      license='MIT',
      author='Cécile Asselin, Guillaume Brioudes, Robin de Mourat',
      python_requires='>=3.5',
      packages=find_packages(),
      install_requires=[
        'networkx',
        'requests'
      ],
      zip_safe=True)
