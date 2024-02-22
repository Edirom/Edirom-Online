<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:xd="http://www.oxygenxml.com/ns/doc/xsl" exclude-result-prefixes="xs xd" version="3.0">

    <xd:doc scope="stylesheet">
        <xd:desc>This stylesheet is intended asa sceond run on HTML content for the Edirom Online, in order to prepend any ID with a prefix and avoid invalid HTML when an object is open multiple times in one Edirom Online insatnce.</xd:desc>
    </xd:doc>
    
    <xd:doc scope="component">
        <xd:desc>The $idPrefix parameter is submitted externally and is the value prepended to IDs etc.</xd:desc>
    </xd:doc>
    <xsl:param name="idPrefix"/>
    
    <xd:doc scope="component">
        <xd:desc>The root template</xd:desc>
    </xd:doc>
    <xsl:template match="/">
        <xsl:apply-templates/>
    </xsl:template>
    
    <xd:doc>
        <xd:desc>Override the dafault template for elements to also apply templates on the attribute axis.</xd:desc>
    </xd:doc>
    <xsl:template match="*">
        <xsl:copy>
            <xsl:apply-templates select="@* | node()"/>
        </xsl:copy>
    </xsl:template>
    
    <xd:doc scope="component">
        <xd:desc>Process id attributes by prepending the $idPrefix.</xd:desc>
    </xd:doc>
    <xsl:template match="@id">
        <xsl:attribute name="id" select="concat($idPrefix, .)"/>
    </xsl:template>
    
    <xd:doc scope="component">
        <xd:desc>Process href attributes to prepend $idPrefix for fragment identifiers.</xd:desc>
    </xd:doc>
    <xsl:template match="@href">
        <xsl:choose>
            <xsl:when test="starts-with(., '#')">
                <xsl:attribute name="href" select="replace(., '#', concat('#', $idPrefix))"/>
            </xsl:when>
            <xsl:otherwise>
                <xsl:copy/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    
    <xd:doc scope="component">
        <xd:desc>Process data-tipped-options attributes to include $idPrefix.</xd:desc>
    </xd:doc>
    <xsl:template match="@data-tipped-options">
        <xsl:attribute name="data-tipped-options" select="replace(., 'inline: ''', concat('inline: ''', $idPrefix))"/>
    </xsl:template>
    
    <xd:doc scope="component">
        <xd:desc>Override default template for attributes, to copy instead of printing text content.</xd:desc>
    </xd:doc>
    <xsl:template match="@*">
        <xsl:copy/>
    </xsl:template>
    
    <xd:doc scope="component">
        <xd:desc>Override default templates for text comments and processing instructions to copy nodes.</xd:desc>
    </xd:doc>
    <xsl:template match="text() | comment() | processing-instruction()">
        <xsl:copy/>
    </xsl:template>
</xsl:stylesheet>